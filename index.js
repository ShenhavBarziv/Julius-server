const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const jwt = require("jsonwebtoken");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: "http://localhost",
//     credentials: true,
//   })
// );
const dotenv = require('dotenv');
dotenv.config();
const {
  AddRegister,
  Login,
  List,
  ListReg,
  DeleteReg,
  ApproveReg,
  DeleteUser,
  GetUserById,
  UpdateUser,
} = require("./mongo/conn");
const PORT = 5000;
app.use(cors({
  origin: 'http://95.216.153.158',
  credentials: true,}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const disallowedTags = ["script", "iframe", "style"]; // Add more as needed
function validateInput(user) {
  for (const [key, value] of Object.entries(user)) {
    for (const tag of disallowedTags) {
      if (
        value === "" ||
        value.length > 50 ||
        value.includes(`<${tag}`) ||
        value.includes(`</${tag}>`)
      ) {
        return false;
      }
    }
  }
  return true;
}
app.get("/api", (req,res) => {
  res.send("hiiiiiii")
  
})
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (validateInput(req.body)) {
    const data = await Login(email, password);
    if (data.user) {
      const token = createSecretToken(data.user._id);
      res.cookie("token", token, {
        httpOnly: false,
        sameSite: "None",
        secure: false,
      });
      
      res.cookie("email", req.body.email, {
        httpOnly: false,
        sameSite: "None",
        secure: false,
      });
      
    }
    res.status(200).json(data);
  } else {
    res.json({ msg: "One of the inputs is invalid" });
  }
});
app.post("/api/register", async (req, res) => {
  user = filterKeys(req.body, [
    "email",
    "password",
    "name",
    "job",
    "birthDate",
    "phoneNumber",
    "position",
    "hireDate",
  ]); //the filter is for unwanted fields that hackers can add in the request(for example: admin:true)
  if (validateInput(req.body)) {
    code = await AddRegister(user);
    if (code === 201) {
      res.cookie("email", user.email, {
        withCredentials: true,
        httpOnly: false,
        sameSite: "None",
        secure: true,
      });
    }
    res.json({ code });
    //201 for successfully created 409 for conflict
  } else {
    res.json({ code: 400, msg: "One of the inputs is invalid" });
  }
});
app.get("/api/list", async (req, res) => {
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status) {
    res.json({
      status: true,
      data: await List(),
      admin: userVerification.user.admin,
    });
  } else {
    res.json({ status: false });
  }
});
function filterKeys(data, allowedKeys) {
  const filteredData = {};
  allowedKeys.forEach((key) => {
    if (data[key] !== undefined) {
      filteredData[key] = data[key];
    }
  });
  return filteredData;
}
app.get("/api/profile", async (req, res) => {
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  res.json(userVerification);
});
app.get("/api/approve", async (req, res) => {
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status && userVerification.user.admin) {
    res.json({ status: true, data: await ListReg() });
  } else if (userVerification.status) {
    res.json({ status: "notAdmin", data: {} });
  } else {
    res.json({ status: "notLoggedIn", data: {} });
  }
});
app.delete("/api/approve", async (req, res) => {
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status && userVerification.user.admin) {
    res.json(await DeleteReg(req.body.id));
  } else {
    res.json({
      status: "Access Denied: You are not authorized to perform this action.",
    });
  }
});

app.post("/api/approve", async (req, res) => {
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status && userVerification.user.admin) {
    res.json(await ApproveReg(req.body.id));
  } else {
    res.json({
      status: "Access Denied: You are not authorized to perform this action.",
    });
  }
});
app.delete("/api/del", async (req, res) => {
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status && userVerification.user.admin) {
    res.json({
      status: true,
      data: await DeleteUser(req.body.id),
      admin: userVerification.user.admin,
    });
  } else {
    res.json({ status: "" });
  }
  res.json();
});
app.get("/api/EditUser", async (req, res) => {
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status) {
    const userData = await GetUserById(req.query.id);
    res.json({
      status: true,
      data: userData,
      admin: userVerification.user.admin,
    });
  } else {
    res.json({ status: "" });
  }
});
app.post("/api/SaveUserChanges", async (req, res) => {
  userData = req.body.userData;
  const userVerification = req.cookies
    ? await UserVerification(req.cookies.token)
    : { status: false };
  if (userVerification.status && userVerification.user.admin) {
    res.json({
      status: true,
      data: await UpdateUser(userData),
      admin: userVerification.user.admin,
    });
  } else {
    res.json({
      status: "Access Denied: You are not authorized to perform this action.",
    });
  }
});
function createSecretToken(id) {
  
  return jwt.sign({ id }, process.env.TOKEN_KEY, {
    expiresIn: 24 * 60 * 60,
  });
}
async function UserVerification(token) {
  if (!token) {
    return { status: false };
  }
  try {
    const data = await jwt.verify(token, process.env.TOKEN_KEY);
    const user = await GetUserById(data.id);
    if (Object.keys(user).length > 0) {
      return { status: true, user: user };
    } else {
      return { status: false };
    }
  } catch (err) {
    return { status: false };
  }
}
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
