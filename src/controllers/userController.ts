import User from "../models/User";
import { protect, admin } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import bcrypt from 'bcryptjs';
import { sendEmail } from "../utils/sendEmail";
import { getPasswordChangeOtpEmailTemplate } from "../utils/emailTemplates";

export default function (appRouter: Router) {
    // @desc    Get all users (with pagination and search)
    // @route   POST /api/v1/user
    // @access  Private/Admin
    appRouter.post("/api/v1/user", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const pageNo = body.pageNo || 1;
            const pageSize = body.pageSize || 10;
            const search = body.search || '';
            const status = body.status || '';

            const query: any = {};

            if (search) {
                query.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            if (status) {
                query.status = status;
            }

            const totalElements = await User.countDocuments(query);
            const totalPages = Math.ceil(totalElements / pageSize);

            const users = await User.find(query)
                .select('-password')
                .skip((pageNo - 1) * pageSize)
                .limit(pageSize)
                .sort({ createdAt: -1 });

            const mappedUsers = users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                position: user.position,
                status: user.status,
                userPermission: user.userPermission,
                roles: user.roles,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));

            appRouter.sendResponse(res, 200, {
                message: "Users retrieved successfully",
                data: {
                    content: mappedUsers,
                    pageNo,
                    pageSize,
                    totalElements,
                    totalPages,
                    last: pageNo >= totalPages
                }
            });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get user by ID
    // @route   POST /api/v1/user/getById/:id
    // @access  Private/Admin
    appRouter.post("/api/v1/user/getById/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;
            if (!await admin(req, res, appRouter)) return;

            const user = await User.findById(req.params.id).select('-password');

            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            const mappedUser = {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                position: user.position,
                status: user.status,
                userPermission: user.userPermission,
                roles: user.roles,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            appRouter.sendResponse(res, 200, { message: "User details retrieved successfully", data: mappedUser });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Create new user (by Admin)
    // @route   POST /api/v1/user/create-user
    // @access  Private/Admin
    appRouter.post("/api/v1/user/create-user", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const { username, email, password, firstName, lastName, position, status, userPermission, roles } = body;

            const userExists = await User.findOne({ $or: [{ email }, { username }] });
            if (userExists) {
                return appRouter.sendResponse(res, 400, { message: "User already exists with that email or username" });
            }

            const user = await User.create({
                username,
                email,
                password,
                firstName,
                lastName,
                position: position || null,
                status: status || 'ACTIVE',
                userPermission: userPermission || 'APPROVED',
                roles: roles || ['CUSTOMER']
            });

            if (user) {
                appRouter.sendResponse(res, 201, {
                    message: "User created successfully",
                    data: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        firstName: user.firstName,
                lastName: user.lastName,
                        position: user.position,
                        status: user.status,
                        userPermission: user.userPermission,
                        roles: user.roles,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                });
            } else {
                appRouter.sendResponse(res, 400, { message: "Invalid user data" });
            }
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Delete user by ID
    // @route   POST /api/v1/user/deleteById/:id
    // @access  Private/Admin
    appRouter.post("/api/v1/user/deleteById/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const user = await User.findById(req.params.id);

            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            await User.findByIdAndDelete(req.params.id);

            appRouter.sendResponse(res, 200, { message: "User deleted successfully", data: { id: user._id } });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Update user
    // @route   POST /api/v1/user/updateById/:id
    // @access  Private/Admin
    appRouter.post("/api/v1/user/updateById/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const user = await User.findById(req.params.id);

            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            const body = await appRouter.parseJsonBody(req);

            if (body.firstName !== undefined) user.firstName = body.firstName;
            if (body.lastName !== undefined) user.lastName = body.lastName;
            user.email = body.email || user.email;
            user.position = body.position !== undefined ? body.position : user.position;
            user.status = body.status || user.status;
            user.userPermission = body.userPermission || user.userPermission;
            user.roles = body.roles || user.roles;

            if (body.password) {
                user.password = body.password; // mongoose pre-save hook will hash it
            }

            const updatedUser = await user.save();

            appRouter.sendResponse(res, 200, {
                message: "User updated successfully",
                data: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    position: updatedUser.position,
                    status: updatedUser.status,
                    userPermission: updatedUser.userPermission,
                    roles: updatedUser.roles,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt
                }
            });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Send OTP to verify password change
    // @route   POST /api/v1/user/send-change-password-otp
    // @access  Private
    appRouter.post("/api/v1/user/send-change-password-otp", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const user = await User.findById(userId);
            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

            user.otp = otp;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Your Password Change Verification Code – NAGA Shop',
                    message: `Your password change verification code is: ${otp}. It will expire in 10 minutes.`,
                    html: getPasswordChangeOtpEmailTemplate(otp)
                });
            } catch (emailErr) {
                console.error('Failed to send password change OTP email', emailErr);
                return appRouter.sendResponse(res, 500, { message: "Could not send verification email. Please try again." });
            }

            // Return masked email so the client can display it
            const maskedEmail = user.email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) =>
                first + '*'.repeat(Math.min(middle.length, 6)) + domain
            );

            appRouter.sendResponse(res, 200, {
                message: "Verification code sent to your email",
                data: { maskedEmail }
            });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Change password (requires OTP verification)
    // @route   POST /api/v1/user/change-password
    // @access  Private
    appRouter.post("/api/v1/user/change-password", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const body = await appRouter.parseJsonBody(req);
            const { otp, newPassword } = body;

            if (!otp || !newPassword) {
                return appRouter.sendResponse(res, 400, { message: "OTP and new password are required" });
            }

            const user = await User.findById(userId);
            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            if (!user.otp || !user.otpExpiresAt || user.otp !== otp || user.otpExpiresAt < new Date()) {
                return appRouter.sendResponse(res, 400, { message: "Invalid or expired verification code" });
            }

            user.password = newPassword;
            user.otp = undefined;
            user.otpExpiresAt = undefined;
            await user.save();

            appRouter.sendResponse(res, 200, { message: "Password changed successfully", data: { id: user._id } });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Change password by admin
    // @route   POST /api/v1/user/change-password-by-admin
    // @access  Private/Admin
    appRouter.post("/api/v1/user/change-password-by-admin", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const { userId, newPassword } = body;

            const user = await User.findById(userId);
            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            user.password = newPassword;
            await user.save();

            appRouter.sendResponse(res, 200, { message: "Password changed by admin successfully", data: { id: user._id } });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get saved cards for current user
    // @route   GET /api/v1/users/saved-cards
    // @access  Private
    appRouter.get("/api/v1/users/saved-cards", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const user = await User.findById(userId).select('savedCards');
            if (!user) return appRouter.sendResponse(res, 404, { message: "User not found" });

            // Return masked data only (never expose pwt in listing)
            const cards = (user.savedCards || []).map((c: any, i: number) => ({
                index: i,
                maskPan: c.maskPan,
                cardType: c.cardType,
                ctid: c.ctid,
            }));

            appRouter.sendResponse(res, 200, { savedCards: cards });
        } catch (e: any) {
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Delete a saved card by index
    // @route   DELETE /api/v1/users/saved-cards/:index
    // @access  Private
    appRouter.delete("/api/v1/users/saved-cards/:index", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const idx = parseInt(req.params.index, 10);
            const user = await User.findById(userId);
            if (!user) return appRouter.sendResponse(res, 404, { message: "User not found" });

            if (isNaN(idx) || idx < 0 || idx >= user.savedCards.length) {
                return appRouter.sendResponse(res, 400, { message: "Invalid card index" });
            }

            user.savedCards.splice(idx, 1);
            await user.save();

            appRouter.sendResponse(res, 200, { message: "Card removed" });
        } catch (e: any) {
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });
}
