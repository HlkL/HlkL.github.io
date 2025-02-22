// catalog js
let catalog = document.getElementById("catalog");
let catalogTopHeight = catalog.offsetTop;
let tocElement = document.getElementsByClassName("catalog-content")[0]

// 是否固定目录
function changePos() {
  let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  if (scrollTop > catalogTopHeight - 20) {
    catalog.style = "position: fixed; top: 20px; bottom: 20px;"
  } else {
    catalog.style = "position: absolute; top: calc(290px + 88px + 30px)"
  }
}

// 是否激活目录
function isActiveCat() {
  // 可宽限高度值
  let offsetHeight = 20

  // 当前页面滚动位置距页面顶部的高度值
  let scrollTop = document.documentElement.scrollTop || document.body.scrollTop

  // 页面所有标题列表
  let headerLinkList = document.getElementsByClassName("headerlink")

  if (!headerLinkList.length) return

  // 页面所有目录列表
  let catLinkList = document.getElementsByClassName("toc-link")

  for(let i = 0; i < catLinkList.length; i++) {
    let currentTopCat = headerLinkList[i].offsetTop - offsetHeight
    let nextTopCat = i + 1 === headerLinkList.length ?
        Infinity : headerLinkList[i+1].offsetTop - offsetHeight

    if (scrollTop >= currentTopCat && scrollTop < nextTopCat) {
      // 目录跟随滚动
      catLinkList[i].className = "toc-link active"
      tocElement.scrollTop = catLinkList[i].offsetTop - 32
    } else {
      catLinkList[i].className = "toc-link"
    }
  }
}

// 窗体高度变化时
function handleResize() {
  let windowHeight = document.documentElement.clientHeight
  tocElement.setAttribute('style', `height: ${windowHeight - 90}px`);
}

// 小屏下（屏宽小于888px）是否展开目录
function openOrHiddenCatalog() {
  let isHidden = catalog.classList.contains('hidden')
  if (isHidden) {
    catalog.classList.remove('hidden')
  } else {
    catalog.classList.add('hidden')
  }
}

changePos();
isActiveCat();
handleResize();
document.addEventListener("scroll", changePos, false);
document.addEventListener("scroll", isActiveCat, false);
window.addEventListener("resize", handleResize, false);
document.querySelector("#btn-catalog").addEventListener("click", openOrHiddenCatalog, false);

// 点击目录项时的平滑滚动
document.addEventListener('DOMContentLoaded', () => {
  const tocLinks = document.querySelectorAll('.toc-link');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = decodeURIComponent(link.getAttribute('href').slice(1));
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // 立即更新目录激活状态
        document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // 立即更新 URL
        history.pushState(null, null, `#${targetId}`);
        
        // 平滑滚动到目标位置
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        // 模糊匹配处理
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const header of headers) {
          if (header.textContent.trim() === link.textContent.trim()) {
            // 立即更新目录激活状态
            document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            header.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            break;
          }
        }
      }
    });
  });
});
