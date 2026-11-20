import asyncio,sys,time
from playwright.async_api import async_playwright
async def run(p,w,h):
    b=await p.chromium.launch(headless=True); ctx=await b.new_context(viewport={"width":w,"height":h},is_mobile=True,has_touch=True,locale="ar"); pg=await ctx.new_page()
    await pg.goto("http://localhost:8080/"); await pg.wait_for_timeout(4000)
    await pg.keyboard.press("Escape")
    for n in ["تأكيد","إغلاق"]:
      l=pg.get_by_role("button",name=n)
      if await l.count() and await l.first.is_visible(): await l.first.click(); await pg.wait_for_timeout(400)
    btn=pg.get_by_role("button",name="ابدأ").first
    await pg.evaluate("window.dispatchEvent(new CustomEvent('x'))")
    opener=pg.locator("button:has-text('خطة'), button:has-text('أقلع')").first
    await opener.click(force=True); await pg.wait_for_timeout(2500)
    r=await pg.evaluate("""()=>{const d=document.querySelector('[role=dialog][aria-label="مساعد أقلع الذكي"]');const i=d&&d.querySelector('input');const s=i&&i.parentElement.querySelector('button');const bb=e=>e?JSON.stringify(e.getBoundingClientRect()):null;return {ih:innerHeight,vv:visualViewport.height,panel:bb(d),input:bb(i),send:bb(s)}}""")
    print(w,h,r); await pg.screenshot(path=f"d{w}.png"); await b.close()
async def main():
  async with async_playwright() as p:
    await run(p,390,844); await run(p,375,667)
asyncio.run(main())
