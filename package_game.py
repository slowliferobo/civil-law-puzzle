import zipfile
import os

def package_game():
    files_to_package = [
        'index.html',
        'style.css',
        'script.js',
        'README.md'
    ]
    
    zip_filename = 'minpou_puzzle_v1.0.0.zip'
    
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for file in files_to_package:
            if os.path.exists(file):
                zipf.write(file)
                print(f"Added {file} to {zip_filename}")
            else:
                print(f"Warning: {file} not found!")

    print(f"Successfully created {zip_filename}")

if __name__ == "__main__":
    package_game()
