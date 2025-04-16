const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// URLs các hình ảnh từ người dùng
const imageUrls = [
  // Vịnh Hạ Long
  {
    url: 'https://raw.githubusercontent.com/username/travel-images/main/halong.jpg',
    fileName: 'halong.jpg'
  },
  // Sapa
  {
    url: 'https://raw.githubusercontent.com/username/travel-images/main/sapa.jpg',
    fileName: 'sapa.jpg'
  },
  // Đà Lạt
  {
    url: 'https://raw.githubusercontent.com/username/travel-images/main/dalat.jpg',
    fileName: 'dalat.jpg'
  },
  // Hội An
  {
    url: 'https://raw.githubusercontent.com/username/travel-images/main/hoian.jpg',
    fileName: 'hoian.jpg'
  },
  // Nha Trang
  {
    url: 'https://raw.githubusercontent.com/username/travel-images/main/nhatrang.jpg',
    fileName: 'nhatrang.jpg'
  },
  // Thành phố Hồ Chí Minh
  {
    url: 'https://raw.githubusercontent.com/username/travel-images/main/hochiminh.jpg',
    fileName: 'hochiminh.jpg'
  }
];

// Thư mục lưu ảnh
const destinationFolder = path.join(__dirname, '../../public/destinations');

// Đảm bảo thư mục tồn tại
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

// Tải và lưu từng ảnh
imageUrls.forEach(({ url, fileName }) => {
  const filePath = path.join(destinationFolder, fileName);
  
  // Xác định protocol (http hoặc https)
  const client = url.startsWith('https') ? https : http;
  
  client.get(url, (response) => {
    // Kiểm tra nếu request chuyển hướng
    if (response.statusCode === 301 || response.statusCode === 302) {
      console.log(`Redirecting to: ${response.headers.location}`);
      return;
    }
    
    // Kiểm tra status code
    if (response.statusCode !== 200) {
      console.error(`Failed to download ${url}. Status code: ${response.statusCode}`);
      return;
    }
    
    // Lưu ảnh vào file
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);
    
    fileStream.on('finish', () => {
      console.log(`Downloaded: ${fileName}`);
    });
    
    fileStream.on('error', (err) => {
      console.error(`Error saving ${fileName}: ${err.message}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${url}: ${err.message}`);
  });
});

console.log('Starting download of images...');

// LƯU Ý: Script này yêu cầu URL thật của hình ảnh. 
// Người dùng cần thay thế URL giả với URL thật của hình ảnh họ muốn sử dụng. 