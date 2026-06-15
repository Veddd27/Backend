import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { logoutUser } from "../controllers/user.controller.js";
import { changeCurrentPassword } from "../controllers/user.controller.js";
import { getCurrentUser } from "../controllers/user.controller.js";
import { updateAccountDetails } from "../controllers/user.controller.js";
import { updateUserAvatar } from "../controllers/user.controller.js";
import { updateUserCoverImage } from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { getUserChannelProfile } from "../controllers/user.controller.js";
import { getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/api/v1/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

    router.route("/api/v1/login").post(loginUser)
    router.route("/api/v1/logout").post(verifyJWT, logoutUser)
    router.route("/api/v1/refresh-token").post(refreshAccessToken)
    router.route("/api/v1/change-password").post(verifyJWT, changeCurrentPassword)
    router.route("/api/v1/current-user").get(verifyJWT, getCurrentUser)
    router.route("/api/v1/update-account").patch(verifyJWT, updateAccountDetails)
    router.route("/api/v1/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
    router.route("/api/v1/cover-image").put(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
    router.route("/api/v1/c/:username").get(getUserChannelProfile)
    router.route("/api/v1/history").get(verifyJWT, getWatchHistory)

export default router
