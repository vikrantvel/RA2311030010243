const axios = require("axios");

const CLIENT_ID = "e3ddda19-407e-4bb8-b922-a36c1e16b8cc";
const CLIENT_SECRET = "sMYxTpFvCgBjVnng";
const EMAIL = "ss0043@srmist.edu.in";
const ROLL_NO = "ra2311030010243";
const ACCESS_CODE = "QkbpxH";

let authToken = null;

async function authenticate() {
    const response = await axios.post(
        "http://20.207.122.201/evaluation-service/auth",
        {
            email: EMAIL,
            name: "vikrantvel.s.p",
            rollNo: ROLL_NO,
            accessCode: ACCESS_CODE,
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
        }
    );
    authToken = response.data.access_token;
}

async function Log(stack, level, package_name, message) {
    if (!authToken) await authenticate();

    await axios.post(
        "http://20.207.122.201/evaluation-service/logs",
        {
            stack,
            level,
            package: package_name,
            message,
        },
        {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        }
    );
}

module.exports = { Log };