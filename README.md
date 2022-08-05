# Hướng dẫn cài đặt Compreface Service

### Requirements

1. Cài đặt Docker desktop([hướng dẫn cài đặt](https://docs.docker.com/desktop/install/windows-install/)) - Lưu ý thực hiện mục "System requirements" trước tiên.
2. CompreFace chạy trên [x86 processor](https://en.wikipedia.org/wiki/X86) và [AVX support](https://en.wikipedia.org/wiki/Advanced_Vector_Extensions). (đa số máy tính đều đáp ứng được.)

### To get started (Linux, MacOS):

1. Cài đặt Docker và Docker Compose
2. Tải file nén: [file](https://github.com/exadel-inc/CompreFace/releases/download/v1.0.1/CompreFace_1.0.1.zip)
3. Giải nén file.
4. Mở terminal ngay tại folder vừa giải nén, chạy câu lệnh: `docker-compose up -d`
5. Mở service trên browser(giao diện login): http://localhost:8000/login

### To get started (Windows):

1. Cài đặt Docker Desktop
2. Tải file nén: [file](https://github.com/exadel-inc/CompreFace/releases/download/v1.0.1/CompreFace_1.0.1.zip)
3. Giải nén file.
4. Chạy Docker desktop.
5. Mở cmd ngay tại folder vừa giải nén, chạy câu lệnh: `docker-compose up -d` (chạy khá lâu và nặng :>)
8. Mở http://localhost:8000/login để kiểm tra service đã chạy chưa.

# Hướng dẫn cài đặt Website 

### Requirements

1. Cài đặt git.
2. Cài đặt [NodeJS](https://nodejs.org/en/) và NPM(có sẵn khi cài NodeJS).

### Installation

1. Clone source code: `git clone https://github.com/ngohiep-nood/UIT-Botchat-Font-end.git`
2. Cài đặt packages: `npm install`
3. Chạy project: `npm run dev`
4. Vào `http://localhost:3000`