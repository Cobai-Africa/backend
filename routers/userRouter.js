import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import data from '../data.js';
import User from '../models/userModel.js';
import { generateToken, isAdmin, isAuth } from '../utils.js';

const userRouter = express.Router();



userRouter.get(
	'/seed',
	expressAsyncHandler(async (req, res) => {
		// await User.remove({});
		const createdUsers = await User.insertMany(data.users);
		res.send({ createdUsers });
	})
);

userRouter.post(
	'/signin',
	expressAsyncHandler(async (req, res) => {
		const user = await User.findOne({ email: req.body.email });
		if (user) {
			if (bcrypt.compareSync(req.body.password, user.password)) {
				res.send({
					_id: user._id,
					name: user.name,
					email: user.email,
					isAdmin: user.isAdmin,
					isSeller: user.isSeller,
					token: generateToken(user),
				});
				return;
			}
		}
		res.status(401).send({ message: 'Invalid email or password' });
	})
);

userRouter.post(
	'/register',
	expressAsyncHandler(async (req, res) => {
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 8),
		});
		const createdUser = await user.save();
		res.send({
			_id: createdUser._id,
			name: createdUser.name,
			email: createdUser.email,
			isAdmin: createdUser.isAdmin,
			isSeller: user.isSeller,
			token: generateToken(createdUser),
		});
	})
);

userRouter.get(
	'/:id',
	expressAsyncHandler(async (req, res) => {
		const user = await User.findById(req.params.id);
		if (user) {
			res.send(user);
		} else {
			res.status(404).send({ message: 'User Not Found' });
		}
	})
);

userRouter.put(
	'/profile',
	isAuth,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findById(req.user._id);
		if (user) {
			user.name = req.body.name || user.name;
			user.email = req.body.email || user.email;
			if (user.isSeller) {
				user.seller.storeName =
					req.body.sellerStoreName || user.seller.storeName;
				user.seller.city = req.body.sellerCity || user.seller.city;
				user.seller.province = req.body.sellerProvince || user.seller.province;
				user.seller.country = req.body.sellerCountry || user.seller.country;
				user.seller.storeAddress =
					req.body.sellerStoreAddress || user.seller.storeAddress;
				user.seller.phoneNumber =
					req.body.sellerPhoneNumber || user.seller.phoneNumber;
				user.seller.businessType =
					req.body.sellerBusinessType || user.seller.businessType;
				user.seller.cac = req.body.sellerCAC || user.seller.cac;
			}
			if (req.body.password) {
				user.password = bcrypt.hashSync(req.body.password, 8);
			}
			const updatedUser = await user.save();
			res.send({
				_id: updatedUser._id,
				name: updatedUser.name,
				email: updatedUser.email,
				isAdmin: updatedUser.isAdmin,
				isSeller: user.isSeller,
				token: generateToken(updatedUser),
			});
		}
	})
);

userRouter.get(
	'/',
	isAuth,
	isAdmin,
	expressAsyncHandler(async (req, res) => {
		const users = await User.find({});
		res.send(users);
	})
);

userRouter.delete(
	'/:id',
	isAuth,
	isAdmin,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findById(req.params.id);
		if (user) {
			if (user.email === 'admin@example.com') {
				res.status(400).send({ message: 'Can Not Delete Admin User' });
				return;
			}
			const deleteUser = await user.remove();
			res.send({ message: 'User Deleted', user: deleteUser });
		} else {
			res.status(404).send({ message: 'User Not Found' });
		}
	})
);

userRouter.put(
	'/:id',
	isAuth,
	isAdmin,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findById(req.params.id);
		if (user) {
			user.name = req.body.name || user.name;
			user.email = req.body.email || user.email;
			user.isSeller = Boolean(req.body.isSeller);
			user.isAdmin = Boolean(req.body.isAdmin);
			user.isAdmin = req.body.isAdmin || user.isAdmin;
			const updatedUser = await user.save();
			res.send({ message: 'User Updated', user: updatedUser });
		} else {
			res.status(404).send({ message: 'User Not Found' });
		}
	})
);

userRouter.put(
	'/vendor/:id',
	isAuth,
	expressAsyncHandler(async (req, res) => {
		const user = await User.findById(req.params.id);
		if (user) {
			user.isSeller = Boolean(req.body.isSeller);
			const updatedUser = await user.save();
			res.send({ message: 'User Updated', user: updatedUser });
		} else {
			res.status(404).send({ message: 'User Not Found' });
		}
	})
);

export default userRouter;
