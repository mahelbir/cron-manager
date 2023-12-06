import {create} from 'zustand'

const useCategoryStateStore = create((set) => ({
    categoryStates: {},
    setCategoryStates: (categoryStates) => {
        set(() => ({categoryStates}))
    },
    toggleCategoryState: (category) => {
        set(state => ({categoryStates: {...state.categoryStates, [category]: !state.categoryStates[category]}}))
    }
}))

export default useCategoryStateStore