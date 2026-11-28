"""Required contact gate regression. Creates a clearly named test draft; sends no email."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("/tmp/browser/contact-gate")

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await context.new_page()
        await page.goto("http://localhost:8080")
        await page.evaluate("""() => {
            sessionStorage.setItem('aqla_study_overlay_dismissed', '1');
            sessionStorage.setItem('aqla_kau_survey_dismissed', '1');
        }""")
        await page.reload()
        await page.wait_for_timeout(1800)
        dialog = page.get_by_role("dialog", name="مساعد أقلع الذكي")
        for _ in range(5):
            if await dialog.is_visible():
                break
            await page.get_by_role("button", name="ابدأ خطة الإقلاع السريعة مع د. مالك", exact=True).click()
            await page.wait_for_timeout(1000)
        await dialog.wait_for()

        async def send(value):
            field = dialog.locator("input")
            await field.wait_for()
            await field.fill(value)
            await dialog.get_by_role("button", name="إرسال", exact=True).click()

        async def blocked():
            assert await dialog.get_by_role("button", name="داخل السعودية", exact=True).count() == 0

        await send("اختبار بوابة الاتصال")
        await dialog.get_by_text("قبل ما نكمل، نحتاج بريدك الإلكتروني ورقم جوالك.", exact=False).wait_for()
        await blocked()
        await dialog.get_by_role("button", name="موافق، نكمل", exact=True).click()
        for value in ["", "broken"]:
            await send(value)
            await dialog.get_by_text("البريد الإلكتروني غير صحيح، تأكد منه من فضلك.", exact=True).last.wait_for()
            await blocked()
        await send("test@gmial.com")
        await dialog.get_by_text("هل تقصد test@gmail.com؟", exact=True).wait_for()
        await blocked()
        await dialog.get_by_role("button", name="احتفظ بما كتبت", exact=True).click()
        for value in ["", "123"]:
            await send(value)
            await dialog.get_by_text("رقم الجوال غير صحيح. مثال: ٠٥٥١٢٣٤٥٦٧", exact=True).last.wait_for()
            await blocked()
        field = dialog.locator("input")
        assert await field.get_attribute("type") == "tel"
        assert await field.get_attribute("inputmode") == "tel"
        await send("٠٥٥٥٠٩٦٤١٢")
        await dialog.get_by_role("button", name="داخل السعودية", exact=True).wait_for()
        assert await page.evaluate("document.documentElement.scrollWidth") == 390
        await page.screenshot(path=str(OUT / "required-contacts.png"))
        print("PASS required notice/email/mobile ordering, Arabic rejection, typo keep-original action, tel input and 390px width")
        await browser.close()

asyncio.run(main())