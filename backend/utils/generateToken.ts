import jwt from 'jsonwebtoken';

const generateToken = (id: string | number) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: (process.env.JWT_EXPIRE || '30d') as any
    });
};

export default generateToken;