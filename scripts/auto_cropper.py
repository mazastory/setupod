import os
import glob
import json
import zipfile
from rembg import remove
from PIL import Image

def process_and_publish_stickers(input_folder, output_folder, zip_path, json_path):
    """
    1. Removes backgrounds from all images in input_folder.
    2. Saves transparent PNGs to output_folder.
    3. Zips all transparent PNGs into a single distribution file.
    4. Generates a JSON metadata file for the website to read dynamically.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    print(f"🔍 입력 폴더 탐색 중: {input_folder}")
    
    extensions = ['*.jpg', '*.jpeg', '*.png']
    files_to_process = []
    
    for ext in extensions:
        files_to_process.extend(glob.glob(os.path.join(input_folder, ext)))
        
    if not files_to_process:
        print("❌ 처리할 이미지 파일을 찾지 못했습니다.")
        return

    print(f"✨ [STEP 1] 총 {len(files_to_process)}개의 스티커 배경 제거 작업을 시작합니다...\n")
    
    metadata = []
    
    for idx, filepath in enumerate(files_to_process, 1):
        filename = os.path.basename(filepath)
        name, _ = os.path.splitext(filename)
        output_filename = f"{name}_투명.png"
        output_path = os.path.join(output_folder, output_filename)
        
        try:
            print(f"[{idx}/{len(files_to_process)}] 자르는 중... : {filename}")
            
            # 이미지 열기 및 배경 제거
            input_image = Image.open(filepath)
            output_image = remove(input_image)
            
            # 투명 PNG로 저장
            output_image.save(output_path, "PNG")
            print(f"  👉 완료! 저장됨: {output_path}")
            
            metadata.append({
                "id": name,
                "original": filename,
                "transparent": output_filename,
                "path": f"assets/cropped_stickers/{output_filename}"
            })
            
        except Exception as e:
            print(f"  ❌ 실패: {filename} (에러: {e})")
            
    # [STEP 2] ZIP 파일 자동 생성
    print(f"\n📦 [STEP 2] 시크릿 룸 배포용 ZIP 압축을 시작합니다...")
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(output_folder):
                for file in files:
                    if file.endswith('.png'):
                        file_path = os.path.join(root, file)
                        # ZIP 내부에 'cropped_stickers' 폴더 없이 파일만 깔끔하게 들어가도록 설정
                        zipf.write(file_path, arcname=file)
        print(f"  👉 압축 완료! 배포용 파일 생성: {zip_path}")
    except Exception as e:
        print(f"  ❌ 압축 실패: {e}")

    # [STEP 3] JSON 메타데이터 생성 (웹사이트 연동용)
    print(f"\n🌐 [STEP 3] 웹사이트 연동용 JSON 데이터를 생성합니다...")
    try:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        print(f"  👉 생성 완료: {json_path}")
    except Exception as e:
        print(f"  ❌ JSON 생성 실패: {e}")

    print("\n🎉 모든 자동화 퍼블리싱 작업이 완료되었습니다! 🚀")
    print("이제 Vercel로 푸시만 하면 웹사이트 갤러리와 시크릿 룸 다운로드 파일이 한 번에 업데이트됩니다.")

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    INPUT_DIR = os.path.join(BASE_DIR, 'assets', 'raw_stickers')
    OUTPUT_DIR = os.path.join(BASE_DIR, 'assets', 'cropped_stickers')
    ZIP_PATH = os.path.join(BASE_DIR, 'assets', 'SETUPOD_Full_Stickers.zip')
    JSON_PATH = os.path.join(BASE_DIR, 'assets', 'stickers_metadata.json')
    
    if not os.path.exists(INPUT_DIR):
        print(f"⚠️ 원본 스티커 폴더가 없습니다. 폴더를 생성합니다:\n{INPUT_DIR}")
        print("이 폴더에 원본 스티커를 넣고 스크립트를 다시 실행해주세요!")
        os.makedirs(INPUT_DIR)
    else:
        process_and_publish_stickers(INPUT_DIR, OUTPUT_DIR, ZIP_PATH, JSON_PATH)
