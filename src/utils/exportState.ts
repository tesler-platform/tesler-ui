import { Store } from 'redux'
import { Store as CoreStore } from '../interfaces/store'
import { ACTIONS_HISTORY } from './actionsHistory'
import html2canvas from 'html2canvas'

function download(state: any, type?: string, name?: string) {
    const blob = new Blob([state], { type: type ? type : 'octet/stream' })
    const href = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.download = name ? name : 'state.json'
    a.href = href
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(href)
    }, 0)
}

export default function exportState(store: Store<CoreStore>) {
    download(JSON.stringify({ payload: JSON.stringify(ACTIONS_HISTORY), preloadedState: JSON.stringify(store.getState()) }))
    html2canvas(document.body).then(r => r.toBlob(b => download(b, 'image/png', 'screen.png')))
}
