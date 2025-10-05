import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import interviewSlice from './slices/interviewSlice.ts'
import candidateSlice from './slices/candidateSlice.ts'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'interview'] // Only persist auth and interview state
}

const rootReducer = combineReducers({
  auth: authSlice,
  interview: interviewSlice,
  candidate: candidateSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => store.dispatch
export const useAppSelector = (selector: (state: RootState) => any) => selector(store.getState())