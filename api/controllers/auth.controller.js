import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma.js"

export const register = async (req, res) => {
  const { username, email, password } = req.body

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create a new user and save it to the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    })

    res.status(201).json({ message: "User created successfully", user: newUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to create a new user" })
  }
}

export const login = async (req, res) => {
  // db operations
  const { username, password } = req.body

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        username
      }
    })

    if (!user) return res.status(401).json({ message: "Invalid credentials" })

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" })

    // Generate a Cookie token
    // res.setHeader("Set-Cookie", "test=" + "myValue").json({ message: "Login successful" })

    const age = 1000 * 60 * 60 * 24 * 7

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    )

    const { password: userPassword, ...userInfo } = user

    res
      .cookie("token", token, {
        httpOnly: true,
        // secure: true,
        maxAge: age
      })
      .status(200)
      .json(userInfo)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Failed to login" })
  }
}

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout successful" })
}
