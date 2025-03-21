/**
 * 处理图片加载失败的情况
 * @param {HTMLImageElement} img - 加载失败的图片元素
 */
function handleImageError(img) {
  // 移除图片的所有事件监听器
  const clone = img.cloneNode(true);
  img.parentNode.replaceChild(clone, img);
  
  const container = document.createElement('div');
  container.className = 'image-loading-container';
  
  const text = document.createElement('div');
  text.className = 'image-loading-text';
  text.textContent = '图片加载失败 (≧△≦)ノ゙';
  
  const originalUrl = document.createElement('div');
  originalUrl.className = 'image-loading-url';
  originalUrl.textContent = '原始链接: ' + (clone.dataset.src || clone.src);
  
  container.appendChild(text);
  container.appendChild(originalUrl);
  
  // 如果图片被包裹在链接中，替换整个链接
  const parent = clone.parentNode;
  if (parent.tagName === 'A') {
    parent.parentNode.replaceChild(container, parent);
  } else {
    clone.parentNode.replaceChild(container, clone);
  }
}

/**
 * 为所有图片添加错误处理
 */
function initImageErrorHandling() {
  const images = document.querySelectorAll('.markdown-body img');
  images.forEach(img => {
    if (!img.hasAttribute('no-lazy')) {
      img.onerror = function() {
        handleImageError(this);
      };
    }
  });
}

// 当 DOM 加载完成时初始化
document.addEventListener('DOMContentLoaded', initImageErrorHandling); 