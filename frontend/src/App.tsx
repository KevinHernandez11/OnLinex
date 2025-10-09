import { Navigate, Route, Routes } from "react-router-dom"

import { MainLayout } from "@/components/layout/main-layout"
import { AiChatPage } from "@/pages/ai-chat-page"
import { CreateRoomPage } from "@/pages/create-room-page"
import { JoinRoomPage } from "@/pages/join-room-page"
import { LandingPage } from "@/pages/landing-page"
import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { TempAccessPage } from "@/pages/temp-access-page"
import { RoomWorkspacePage } from "@/pages/room-workspace-page"

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="rooms">
          <Route path="create" element={<CreateRoomPage />} />
          <Route path="join" element={<JoinRoomPage />} />
          <Route path=":code" element={<RoomWorkspacePage />} />
        </Route>
        <Route path="ai" element={<AiChatPage />} />
        <Route path="temp-access" element={<TempAccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
