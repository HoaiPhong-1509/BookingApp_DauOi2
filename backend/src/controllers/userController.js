import User from '../models/User.js';

export const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json({ message: "Tạo tài khoản thành công", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};