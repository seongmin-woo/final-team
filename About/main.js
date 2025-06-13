document.querySelectorAll('.team-member').forEach((member) => {
  const img = member.querySelector('.image-wrapper img')

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  if (isTouch) {
    img.addEventListener('click', () => {
      member.classList.toggle('expanded')
    })
  } else {
    img.addEventListener('mouseenter', () => {
      member.classList.add('expanded')
    })
    member.addEventListener('mouseleave', () => {
      member.classList.remove('expanded')
    })
  }
})
