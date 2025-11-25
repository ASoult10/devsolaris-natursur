# scrape_natursur.py
import json
import time
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

BASE_URL = "https://natursur.herbalife.com/es-es/u"
OUTPUT_FILE = "devsolaris-natursur/devsolaris-chatbot/productos_scrapeados.json"
URL_HEADER = "https://natursur.herbalife.com"

def fix_image_url(url):
    if not url:
        return ""
    if url.startswith("http"):
        return url
    return URL_HEADER + url

def filter_invalid_products(productos):
    cleaned = []

    for producto in productos:
        # Remove HTML tags safely
        desc = producto["descripcion"]
        desc = re.sub(r"<.*?>", "", desc).strip()  # removes any <tag>
        desc = re.sub(r"<*?", "", desc).strip()  # removes any <tag>


        producto["descripcion"] = desc

        # Price must exist and contain EUR
        precio = producto.get("precio", "")
        if precio == "" or "EUR" not in precio:
            continue  # skip this product

        cleaned.append(producto)

    return cleaned
def setup_driver(headless=True):
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("user-agent=Mozilla/5.0 (compatible; MiScraper/1.0; +https://tusitio.example)")
    from selenium.webdriver.chrome.service import Service
    from webdriver_manager.chrome import ChromeDriverManager

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    return driver

def extract_product_from_page(html, url):
    soup = BeautifulSoup(html, "html.parser")

    # 1) Intentar JSON-LD
    ld = soup.find("script", type="application/ld+json")
    if ld and ld.string:
        try:
            data = json.loads(ld.string)
            # Puede venir como dict o lista
            if isinstance(data, list):
                data = data[0]
            name = data.get("name") or data.get("headline")
            description = data.get("description")
            image = None
            if isinstance(data.get("image"), (list, tuple)):
                image = data.get("image")[0]
            else:
                image = data.get("image")
            price = None
            offers = data.get("offers") or {}
            if isinstance(offers, list):
                offers = offers[0]
            price = offers.get("price") if offers else None

            return {
                "id": slugify(name or url),
                "nombre": name or "",
                "descripcion": description or "",
                "imagen": fix_image_url(image) or "",
                "precio": f"{price} {offers.get('priceCurrency','')}".strip() if price else ""
            }
        except Exception:
            pass

    # 2) Fallback: og meta
    og_title = soup.find("meta", property="og:title")
    og_image = soup.find("meta", property="og:image")
    og_description = soup.find("meta", property="og:description")
    name = og_title["content"] if og_title else None
    image = og_image["content"] if og_image else None
    description = og_description["content"] if og_description else None

    # 3) Buscar precio textual en la página (regex buscando €, € or digits)
    text = soup.get_text(" ", strip=True)
    price_match = re.search(r"(\d{1,3}(?:[.,]\d{1,2})?)\s*(€|EUR)", text)
    precio = price_match.group(1)+"€" if price_match else ""

    return {
        "id": slugify(name or url),
        "nombre": name or "",
        "descripcion": description or "",
        "imagen": URL_HEADER + image or "",
        "precio": precio
    }

def slugify(s):
    if not s:
        return "sin-nombre"
    s = re.sub(r"\s+", "-", s.strip().lower())
    s = re.sub(r"[^a-z0-9\-]", "", s)
    return s[:60]

def main():
    driver = setup_driver(headless=True)
    driver.get(BASE_URL)
    time.sleep(3)  # espera que cargue JS

    soup = BeautifulSoup(driver.page_source, "html.parser")

    # ===== EXTRAER LINKS de productos desde la página de listado =====
    # Selecciona todos los <a> que parezcan llevar a productos.
    # Esto es genérico: busca anchors con href que contengan '/product' o '/p/' etc.
    product_links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/product" in href or "/productos" in href or "/p/" in href:
            if href.startswith("/"):
                href = "https://natursur.herbalife.com" + href
            product_links.add(href)

    # Si no encontró, intenta coger elementos con role=link dentro de tarjetas
    if not product_links:
        for div in soup.find_all(class_=re.compile("product|tile|card", re.I)):
            a = div.find("a", href=True)
            if a:
                href = a["href"]
                if href.startswith("/"):
                    href = "https://natursur.herbalife.com" + href
                product_links.add(href)

    productos = []
    print(f"Encontrados {len(product_links)} enlaces de producto (se procesarán hasta 50).")
    for i, url in enumerate(list(product_links)[:50], start=1):
        try:
            print(f"[{i}] Abriendo {url}")
            driver.get(url)
            time.sleep(2 + (i % 2))  # pausita
            producto = extract_product_from_page(driver.page_source, url)
            # Si no tiene imagen, intentar buscar <img> con data-src o similar
            if not producto["imagen"]:
                soup_p = BeautifulSoup(driver.page_source, "html.parser")
                img = soup_p.find("img")
                if img and img.get("src"):
                    producto["imagen"] = BASE_URL + img.get("src")
            
            productos.append(producto)
        except Exception as e:
            print("Error al procesar", url, e)

    driver.quit()

    productos = filter_invalid_products(productos)

    # Guardar en JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(productos, f, ensure_ascii=False, indent=2)

    print("Guardado en", OUTPUT_FILE)

if __name__ == "__main__":
    main()
