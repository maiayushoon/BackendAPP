// import { asyncHandler } from "../utils/asyncHandler.js";
// import apiError from "../utils/apiError.js";
// import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { apiResponse } from "../utils/apiResponse.js";

// const generateAccessTokenAndRefreshToken = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accessToken = user.generateAccessToken();
//     const refreshToken = user.generateRefreshToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     throw new apiError(
//       500,
//       "Something went wrong while generating token"
//     );
//   }
// };

// const registerUser = asyncHandler(async (req, res) => {
//   // res.status(200).json(
//   //     { message: "OK" }
//   // )
//   // 1. get user details from frontend
//   // 2. validation - nort empty
//   // 3. check if user already exists? username and email
//   // 4. check for images
//   // 5. check for avatars
//   // 6. is Available upload them to the cloudinary, avatar
//   // 7. create user object - create entry in db
//   // 8. remove password and refresh token field from response
//   // 9. check for user creation
//   //10. return response

//   const { fullName, email, username, password } = req.body;
//   // console.log("email : ", email)

//   // if(fullName === ""){
//   //     throw new apiError(400, "fullName is required");
//   // }
//   //expert profecional approach

//   if (
//     [fullName, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new apiError(400, "All Fields are Required!!");
//   }

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });


//   if (existedUser) {
    
//       throw new apiError(409, `Username ${username} has already been taken`);
    
//   }

//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
//   // console.log(req.files);
//   // console.log(req);

//   let coverImageLocalPath;
//   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
//       coverImageLocalPath = req.files.coverImage[0].path
//   }

//   if (!avatarLocalPath) {
//     throw new apiError(400, "Avatar image is required");
//   }

//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new apiError(400, "Avatar image is required");
//   }

//   const user = await User.create({
//     fullName,
//     email,
//     avatar: avatar.url,
//     coverImage: coverImage?.url || "",
//     password,
//     username: username.toLowerCase(),
//   });

//   const createdUser = await User.findById(user._id).select(
//     // remove  __v from the result object
//     "-password -refreshToken"
//   );

//   if (!createdUser) {
//     throw new apiError(500, "Something went wrong when creating the account");
//   }

//   return res.status(201).json(new apiResponse(200, "Account successfully created", createdUser));
// });

// const loginUser = asyncHandler(async (req, res) => {
//   //req.body -> data
//   //username or pasword
//   //fund the user 
//   //password check
//   //access and refresh token given
//   //send cookies

//   try {
//     const { email, username, password } = req.body; // Extracting details from the request body

//     if (!(username || email)) {
//       throw new apiError(400, "Username or Email is required.");
//     }

//     const user = await User.findOne({
//       //find  a single document in the database that matches this query
//       $or: [{ username }, { email }], //mongodb operator
//     });

//     if (!user) {
//       throw new apiError(404, "Invalid credentials");
//     }

//     const isPasswordValid = await user.isPasswordCorrect(password);

//     if (!isPasswordValid) {
//       throw new apiError(401, "Invalid credentials");
//     }

//     const { accessToken, refreshToken } =
//       await generateAccessTokenAndRefreshToken(user._id);

//     const loggedInUser = User.findById(user._id).select(
//       "-password -refreshToken"
//     );

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", refreshToken, options)
//       .json(
//         new apiResponse(
//           200,
//           {
//             user: loggedInUser,
//             accessToken,
//             refreshToken,
//           },

//           "User LoggedIn Successfully"
//         )
//       ); // Send success response
//   } catch (error) {
//     console.error("Error during registration:", error);
//     res
//       .status(error.status || 500)
//       .send(error.message || "Internal Server Error");
//   }
// });

// const logoutUser = asyncHandler(async (req, res) => {
//   await User.findByIdAndUpdate(
//     res.user._id,
//     {
//       $set: {
//         refreshToken: undefined,
//       },
//     },
//     {
//       new: true,
//     }
//   );
//   const options = {
//     httpOnly: true,
//     secure: true,
//   };
//   return res
//     .status(200)
//     .clearCookie("accessToken", options)
//     .clearCookie("refreshToken", options)
//     .json(new apiResponse(200, {}, "User loggedout Successfully"));
// });

// export { registerUser };
// export { loginUser };
// export { logoutUser };

import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Something went wrong while generating token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => !field.trim())) {
    throw new apiError(400, "All fields are required!!");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new apiError(409, `Username ${username} has already been taken`);
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new apiError(500, "Something went wrong when creating the account");
  }

  return res.status(201).json(new apiResponse(200, "Account successfully created", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(username || email)) {
    throw new apiError(400, "Username or Email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new apiError(404, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User LoggedIn Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new apiResponse(200, {}, "User loggedout Successfully"));
  });

export { registerUser, loginUser, logoutUser };
