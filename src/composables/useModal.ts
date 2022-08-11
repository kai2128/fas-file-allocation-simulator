const [show, toggleModal] = useToggle()

export function useModal(initialState = false) {
  toggleModal(initialState)
  return {
    show,
    toggleModal,
  }
}
