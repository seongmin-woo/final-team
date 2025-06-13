// 1. 슬라이드 배너
const track = document.getElementById('sliderTrack')
const slideImgs = [
  'image/banner1.jpg',
  'image/banner2.jpg',
  'image/banner3.jpg',
]
const slideLinks = [
  'https://dreamhack.io',
  'https://portswigger.net/web-security',
  'https://owasp.org/www-project-webgoat',
]

track.innerHTML = `
  <div class="slide"><img src="${slideImgs.at(-1)}" data-link="${slideLinks.at(
  -1
)}" /></div>
  ${slideImgs
    .map(
      (src, i) =>
        `<div class="slide"><img src="${src}" data-link="${slideLinks[i]}" /></div>`
    )
    .join('')}
  <div class="slide"><img src="${slideImgs[0]}" data-link="${
  slideLinks[0]
}" /></div>
`
const slides = track.querySelectorAll('.slide')
const slideImgsEls = track.querySelectorAll('.slide img')
let idx = 1,
  slideCount = slideImgs.length,
  isTransitioning = false

function setTransition(on) {
  track.style.transition = on ? 'transform 0.6s' : 'none'
}
function showSlide(i, withTransition = true) {
  setTransition(withTransition)
  track.style.transform = `translateX(-${i * slides[0].clientWidth}px)`
}
function nextSlide() {
  if (!isTransitioning) {
    isTransitioning = true
    idx++
    showSlide(idx, true)
  }
}
track.addEventListener('transitionend', () => {
  if (idx === slideCount + 1) {
    setTransition(false)
    idx = 1
    showSlide(idx, false)
  }
  if (idx === 0) {
    setTransition(false)
    idx = slideCount
    showSlide(idx, false)
  }
  isTransitioning = false
})
let timer = setInterval(nextSlide, 4000)
slideImgsEls.forEach((img) =>
  img.addEventListener('click', () => {
    const link = img.getAttribute('data-link')
    if (link) window.open(link, '_blank')
  })
)
track.addEventListener('mouseenter', () => clearInterval(timer))
track.addEventListener(
  'mouseleave',
  () => (timer = setInterval(nextSlide, 4000))
)
window.addEventListener('resize', () => showSlide(idx, false))

function waitImagesLoaded(cb) {
  const imgs = Array.from(track.querySelectorAll('.slide img'))
  let loaded = 0
  imgs.forEach((img) => {
    if (img.complete) loaded++
    else {
      img.addEventListener('load', () => {
        if (++loaded === imgs.length) cb()
      })
      img.addEventListener('error', () => {
        if (++loaded === imgs.length) cb()
      })
    }
  })
  if (loaded === imgs.length) cb()
}
waitImagesLoaded(() => showSlide(idx, false))
//1

let techniques = []
const cardList = document.getElementById('cardList')
const searchInput = document.getElementById('searchInput')
const searchForm = document.getElementById('searchForm')
let filter = { search: '' },
  searchMatches = [],
  currentMatchIdx = 0

// 2. 키워드 하이라이트
function highlightKeyword(html, keyword) {
  if (!keyword) return html
  const re = new RegExp(
    `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  )
  return html.replace(re, '<mark class="search-highlight">$1</mark>')
}
//2

// 2. 카드 렌더링 시 하이라이트
function renderCards() {
  cardList.innerHTML = ''
  let filtered = techniques.filter(
    (t) =>
      !filter.search ||
      t.title.toLowerCase().includes(filter.search) ||
      (t.detail && t.detail.toLowerCase().includes(filter.search))
  )
  //2

  // 2. 검색 결과가 없습니다.
  if (!filtered.length) {
    cardList.innerHTML = '<div class="no-result">검색 결과가 없습니다.</div>'
    searchMatches = []
    currentMatchIdx = 0
    return
  }
  filtered.forEach((tech) => {
    const card = document.createElement('div')
    card.className = 'card toggle-card'
    card.tabIndex = 0
    const title = highlightKeyword(tech.title, filter.search)
    const desc = highlightKeyword(tech.description, filter.search)
    const detail = highlightKeyword(tech.detail, filter.search)
    card.innerHTML = `
      <img src="${tech.imageSrc}" alt="${tech.title}" class="card-img" />
      <div class="card-content">
        <h2 class="card-title">${title}</h2>
        <p class="card-desc">${desc}</p>
        <div class="card-detail">${detail}</div>
      </div>
      <button class="toggle-arrow" aria-label="상세 펼치기/접기"></button>
    `
    //2

    // 3-1. 카드 토글
    card.querySelector('.toggle-arrow').addEventListener('click', (e) => {
      card.classList.toggle('open')
      e.stopPropagation()
    })
    cardList.appendChild(card)
  })
  //3-1

  // 3-1. 카드 토글 ( 검색 하이라이트 순환 )
  if (filter.search) {
    searchMatches = []
    currentMatchIdx = 0
    cardList
      .querySelectorAll('.card.toggle-card')
      .forEach((card) =>
        card
          .querySelectorAll('.search-highlight')
          .forEach((mark) => searchMatches.push({ card, mark }))
      )
  } else {
    searchMatches = []
    currentMatchIdx = 0
  }
  //3-1

  document.body.addEventListener(
    'click',
    function closeAll(e) {
      if (e.target.closest('.toggle-card') || e.target === searchInput) return
      document
        .querySelectorAll('.toggle-card')
        .forEach((el) => el.classList.remove('open'))
    },
    { once: true }
  )
}

fetch('techniques.json')
  .then((res) => res.json())
  .then((data) => {
    techniques = data
    renderCards()
  })

// 2. 검색 입력 및 필터링
// 5. 검색창 파란 테두리
searchInput.addEventListener('input', (e) => {
  filter.search = e.target.value.toLowerCase()
  renderCards()
  searchForm.classList.toggle('active', !!e.target.value.trim())
})
//5

searchInput.addEventListener('click', (e) => e.stopPropagation())
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && filter.search && searchMatches.length) {
    searchMatches.forEach(({ mark }) => mark.classList.remove('blink'))
    const match = searchMatches[currentMatchIdx]
    match.card.classList.add('open')
    setTimeout(() => {
      match.mark.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      })
      match.mark.classList.add('blink')
      setTimeout(() => match.mark.classList.remove('blink'), 1500)
    }, 100)
    currentMatchIdx = (currentMatchIdx + 1) % searchMatches.length
    e.preventDefault()
  }
})
//2

// 4. 상단 이동 버튼
const scrollTopBtn = document.getElementById('scrollTopBtn')
window.addEventListener('scroll', () => {
  scrollTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none'
})
scrollTopBtn.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
)
//4
