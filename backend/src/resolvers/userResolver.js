import jwt from "jsonwebtoken";
import Joi from "joi";
import { User } from "../models/User.js";
import { Error, Query } from "mongoose";

const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const userResolvers = {
  Query: {
    users: async (_, __, { user }) => {
      if (!user) throw new Error("Authentication required");
      try {
        return await User.find();
      } catch (err) {
        throw new Error("Eroor fetvhing users: " + err, message);
      }
    },
    user: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required");
      try {
        const foundUser = await User.findById(id);
        if (!foundUser) throw new Error("User not found");
        return foundUser;
      } catch (err) {
        throw new Error("failed to fetch user");
      }
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const { error } = userSchema.validate(input);
      if (error) throw new Error(error.details[0].message);
      try {
        const user = new User(input);
        return await user.save();
      } catch (err) {
        if (err.code === 11000) {
          throw new Error("Email address is already in use");
        }
        throw new Error("Failed to create user:" + err.message);
      }
    },

    updateUser: async (_, { id, input }, { user }) => {
      if (!user) throw new Error("Authentication required");
      if (user.userId !== id)
        throw new Error("Unauthorised access,cannot update other user");

      try {
        const updatedUser = await User.findByIdAndUpdate(id, input, {
          new: true,
        });
        if (!updatedUser) throw new Error("User not found for update");
        return updatedUser;
      } catch (err) {
        throw new Error("Failed to update:" + err.message);
      }
    },
    deleteUser: async (_, { id }, { user }) => {
      if (!user) throw new Error("Authentication required");
      if (user.userId !== id)
        throw new Error("Unauthorised access, cannot delete other user");

      try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) throw new Error("User not found for deletion");
        return deletedUser;
      } catch (err) {
        throw new Error("Failed to delete:" + err.message);
      }
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid email or password");

      const isMatch = await user.comparePassword(password);
      if (!isMatch) throw new Error("Invalid email or password");
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );
      return { token, user };
    },
  },
};
