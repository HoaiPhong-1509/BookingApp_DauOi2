import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        hoTen: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        matKhau: {
            type: String,
            required: true,
            select: false
        },

        vaiTro: {
            type: String,
            enum: ["admin", "nhanvien", "quanly"],
            default: "nhanvien"
        },

        trangThai: {
            type: String,
            enum: ["hoatdong", "choduyet","bikhoa"],
            default: "hoatdong"
        },

        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Mã hóa mật khẩu trước khi lưu vào database
userSchema.pre("save", async function (next) {
    if (!this.isModified("matKhau")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.matkhau = await bcrypt.hash(this.matKhau, salt);

    next();
});

const User = mongoose.model("User", userSchema);

export default User;