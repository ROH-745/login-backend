const express = require("express");
const sequelize = require("./db")
const User = require("./models/User")(sequelize);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");


const app = express();

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database has been established succcesfully");
    await sequelize.sync({ alter: true });
    console.log("Model is synchronized with database");
    
  } catch (error) {
    console.log("Unable to connect to databse", error);
    
  }
})();

app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });
    res.status(201).json({ message: "User registerd Succesfully", user });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({message:"server Error"})
    
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid Credential" });
    }
    const token = jwt.sign({ userId: user.id }, "6764jkgkkgjk995959jkkjg446", {
      expiresIn: "1h"
    });
    res.json({token})
  } catch (error) {
    console.error("Error logging in ", error);
    res.status(500).json({message:"Server errror"})
    
  }
})

// Middle ware to verify jwt token

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Acces denied" });
  }
  try {
    const decoded = jwt.verify(
      token.split("")[1],
      "6764jkgkkgjk995959jkkjg446"
    );
    req.user = decoded;
    next()
  } catch (error) {
    console.error("Error verifying token", error);
    res.status(401).json({message:"Invalid Token"})
    
  }
}


// protected route to get user info
app.get("/userinfo", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user })
    
  } catch { error } {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Server Error" });
    
  }
});