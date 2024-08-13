import { create } from "zustand"
import apiRequest from "./apiRequest"

const useNotificationStore = create(set => ({
  number: 0,
  fetch: async () => {
    const res = await apiRequest.get("/users/notification")
    set({ number: res.data })
  },
  decrease: () => set(state => ({ number: state.number - 1 })),
  reset: () => {
    set({ number: 0 })
  }
}))

export default useNotificationStore
