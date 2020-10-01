import {writable} from 'svelte/store'

const windowWidth = writable(window.innerWidth)
const needModal = writable(false)

export {windowWidth, needModal}