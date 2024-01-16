function confirmDeletion() {
  const deleteBtns = document.querySelectorAll(".delete-btn");
  deleteBtns.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", clickDeleteBtn);
  });
}

function clickDeleteBtn (event) {
  event.preventDefault();
  const deleteForm = this.closest("form");
  const contentType = deleteForm.getAttribute("delete-group");
  const contentName = deleteForm.getAttribute("delete-name");
  const msg = `本当に削除しますか？\n${contentType}: ${contentName}`
  if(!confirm(msg)) return null;
  this.removeEventListener("click", clickDeleteBtn);
  this.click();
}

window.addEventListener("load", confirmDeletion);
