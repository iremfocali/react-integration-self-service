import pdfplumber
import re

PDF_PATH = "RMCKBT-Web DataLayer Event Şablonu Entegrasyonu-150525-113355.pdf"

# dataLayer pushlarını ve parametrelerini tespit etmek için regex
push_pattern = re.compile(r"dataLayer\.push\((\{.*?\})\)", re.DOTALL)

with pdfplumber.open(PDF_PATH) as pdf:
    full_text = ""
    for page in pdf.pages:
        full_text += page.extract_text() + "\n"

# dataLayer pushlarını bul
pushes = push_pattern.findall(full_text)

if not pushes:
    print("Hiç dataLayer.push bulunamadı.")
else:
    for i, push in enumerate(pushes, 1):
        print(f"\n--- dataLayer.push #{i} ---")
        print(push)
        # Parametreleri anahtar-değer olarak ayırmaya çalış
        param_pattern = re.compile(r'([\'\"]?\w+[\'\"]?)\s*:\s*([\'\"].*?[\'\"]|\d+|true|false|null)', re.DOTALL)
        params = param_pattern.findall(push)
        if params:
            print("Parametreler:")
            for key, value in params:
                print(f"  {key.strip(': ')}: {value}")
        else:
            print("Parametreler ayrıştırılamadı.") 