"""Run against the local preview: python3 <this file>. No WhatsApp messages are sent."""
import asyncio
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.async_api import async_playwright

ORIGIN = "http://localhost:8080"
ARTIFACTS = Path("/tmp/browser/whatsapp")


async def assert_share(page, button, expected_link):
    await page.evaluate("""() => {
      window.__shareCalls = [];
      const original = window.open.bind(window);
      window.open = (...args) => { window.__shareCalls.push(args); return original(...args); };
    }""")
    assert await page.evaluate("window.__shareCalls.length") == 0
    async with page.expect_popup() as popup_info:
        await button.click()
    popup = await popup_info.value
    await popup.wait_for_load_state()
    parsed = urlparse(popup.url)
    assert parsed.scheme == "https" and parsed.netloc == "wa.me" and parsed.path == "/"
    lines = parse_qs(parsed.query)["text"][0].split("\n")
    assert len(lines) == 3 and lines[1] == "" and lines[2] == expected_link
    assert not any(c.isascii() and c.isalnum() for c in lines[0])
    calls = await page.evaluate("window.__shareCalls")
    assert len(calls) == 1 and calls[0][1:] == ["_blank", "noopener,noreferrer"]
    await popup.close()


async def assert_fits(page, buttons):
    assert await page.evaluate("document.documentElement.scrollWidth") == 390
    for button in buttons:
        await button.scroll_into_view_if_needed()
        bounds = await button.bounding_box()
        assert bounds and bounds["x"] >= 0 and bounds["x"] + bounds["width"] <= 390
        assert bounds["y"] >= 0 and bounds["y"] + bounds["height"] <= 844


async def main():
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        # Observe the real opened URL without contacting WhatsApp or transmitting a plan token.
        await context.route("https://wa.me/**", lambda route: route.fulfill(body="Share URL verified"))
        page = await context.new_page()
        await page.goto(ORIGIN)
        await page.evaluate("sessionStorage.setItem('aqla_study_overlay_dismissed','1')")
        await page.reload()
        await page.wait_for_timeout(2000)
        await page.get_by_role("button", name="ابدأ خطة الإقلاع السريعة مع د. مالك", exact=True).click()
        dialog = page.get_by_role("dialog", name="مساعد أقلع الذكي")
        await dialog.wait_for()

        async def choice(label):
            await dialog.get_by_role("button", name=label, exact=True).click()

        async def text(value):
            field = dialog.get_by_role("textbox")
            await field.fill(value)
            await dialog.get_by_role("button", name="إرسال", exact=True).click()

        async def multi(label):
            await choice(label)
            await choice("إرسال")

        await text("اختبار المشاركة")
        await choice("داخل السعودية")
        await text("جدة")
        await choice("فهمت، نكمل")
        await choice("25 – 39")
        await choice("ذكر")
        await multi("سجائر")
        await choice("لا، تخطَّ الاختبار")
        await multi("لا شيء مما سبق")
        await choice("لا يوجد شيء بالقلب")
        await choice("لا يوجد")
        await choice("لا")
        await multi("لا شيء مما سبق")
        await choice("8")
        await choice("أبي أقلع الآن")
        await choice("اليوم")
        await multi("مع القهوة")
        await choice("لا، هذه أول مرة")
        await text("لا أحد")
        await choice("لا، تخطَّ")
        await choice("لا، يكفي العرض والتحميل")
        share = dialog.get_by_role("button", name="أرسل خطتي على واتساب", exact=True)
        await share.wait_for(timeout=60000)
        pdf = dialog.get_by_role("button", name="تحميل خطتي PDF", exact=True)
        dashboard = dialog.get_by_role("button", name="الذهاب للوحة التحكم", exact=True)
        await assert_fits(page, [pdf, share, dashboard])
        await page.screenshot(path=str(ARTIFACTS / "chat-actions.png"))
        # Capture the dynamically-created saved-plan URL from the actual click.
        await page.evaluate(r"""() => {
          window.__sharedLink = null;
          const original = window.open.bind(window);
          window.open = (...args) => {
            window.__sharedLink = new URL(args[0]).searchParams.get('text').split('\n')[2];
            return original(...args);
          };
        }""")
        async with page.expect_popup() as popup_info:
            await share.click()
        popup = await popup_info.value
        await popup.close()
        plan_link = await page.evaluate("window.__sharedLink")
        assert plan_link.startswith(ORIGIN + "/quit-plan/")
        await assert_share(page, share, plan_link)
        assert await dialog.is_visible() and page.url == ORIGIN + "/"
        print("PASS: all three chat actions fit; sharing keeps the drawer open and uses the saved plan link.")

        await page.goto(plan_link)
        plan_share = page.get_by_role("button", name="أرسل خطتي على واتساب", exact=True)
        await plan_share.wait_for(timeout=60000)
        await assert_fits(page, [plan_share])
        await page.screenshot(path=str(ARTIFACTS / "plan-actions.png"))
        await assert_share(page, plan_share, page.url)
        print("PASS: plan-page action fits 390×844; WhatsApp text has a blank line and URL-only third line.")
        support = page.get_by_role("button", name="تواصل مع فريق أقلع على واتساب", exact=True)
        call = page.get_by_role("button", name="اتصال مباشر", exact=True)
        await assert_fits(page, [support, call])
        await page.screenshot(path=str(ARTIFACTS / "plan-support.png"))
        async with page.expect_popup() as popup_info:
            await support.click()
        popup = await popup_info.value
        await popup.wait_for_load_state()
        url = urlparse(popup.url)
        assert url.netloc == "wa.me" and url.path == "/966" + "542298004"
        message = parse_qs(url.query)["text"][0]
        assert not any(c.isascii() and c.isalnum() for c in message)
        assert "http" not in message and "/quit-plan/" not in message
        assert plan_link.split("/")[-1] not in message
        for personal_answer in ["اختبار المشاركة", "جدة", "لا أحد"]:
            assert personal_answer not in message
        assert len((await page.evaluate("window.__shareCalls"))[-1]) == 3
        assert (await page.evaluate("window.__shareCalls"))[-1][1:] == ["_blank", "noopener,noreferrer"]
        await popup.close()
        print("PASS: support row fits; team message contains no URL, token, nickname, answers, Latin letters or digits.")
        session = await context.new_cdp_session(page)
        await session.send("Page.enable")
        navigation_requests = []
        session.on("Page.frameRequestedNavigation", lambda event: navigation_requests.append(event["url"]))
        await call.click()
        await page.wait_for_timeout(500)
        assert "tel:+966" + "542298004" in navigation_requests
        print("PASS: direct call requests the official business phone link.")
        await browser.close()


asyncio.run(main())