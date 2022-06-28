import { useDispatch, useSelector } from 'react-redux'
import { Store } from '../../interfaces/store'
import { useEffect } from 'react'

export const SSO_AUTH = 'SSO_AUTH'

export function useSsoAuth<S extends Store>(defaultAuthType = SSO_AUTH) {
    const sessionActive = useSelector((state: S) => state.session.active)
    const logoutRequested = useSelector((state: S) => state.session.logout)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!sessionActive && !logoutRequested) {
            dispatch({ type: defaultAuthType })
        }
    }, [sessionActive, logoutRequested, dispatch, defaultAuthType])

    return { sessionActive }
}
