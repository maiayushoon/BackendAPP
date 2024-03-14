import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js"
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    // res.status(200).json(
    //     { message: "OK" }
    // )
    // 1. get user details from frontend 
    // 2. validation - nort empty 
    // 3. check if user already exists? username and email
    // 4. check for images 
    // 5. check for avatars
    // 6. is Available upload them to the cloudinary, avatar
    // 7. create user object - create entry in db 
    // 8. remove password and refresh token field from response 
    // 9. check for user creation 
    //10. return response 

    const { fullName, email, username, password } = req.body
    // console.log("email : ", email)

    // if(fullName === ""){
    //     throw new apiError(400, "fullName is required");
    // }
    //expert profecional approach 

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All Fields are Required!!")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    //=============================================================lol==================

    if (existedUser) {
        if (existedUser.username === username) {
            throw new apiError(409, `Username ${username} has already been taken`)
        }
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(req.files);
    // console.log(req);

    let coverImageLocalPath;
    if(res.files && Array.isArray(res.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    } else {
        coverImageLocalPath = null;
    }


    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new apiError(400, "Avatar image is required")
    }

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select( // remove  __v from the result object
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong when creating the account")
    }

    return res.status(201).json(
        new apiResponse(200, "Account successfully created", createdUser)
    );
})

export { registerUser }