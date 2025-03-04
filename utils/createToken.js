import jwt from 'jsonwebtoken'

const generateToken = (userId, role) => {
    return jwt.sign({ userId, role },process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE}
    );
};

export default generateToken;