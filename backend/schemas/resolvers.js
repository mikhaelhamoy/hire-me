const { AuthenticationError } = require("apollo-server-express");
// import { PrismaClient } from '@prisma/client';

const { User, Job } = require("../models");
const { signToken } = require("../utils/auth");

// const prisma = new PrismaClient();

const resolvers = {
  Query: {
    user: async (parent, { email }) => {
      return User.findOne({ email }).select("-__v -password");
    },
    job: async (parent, { title }) => {
      return Job.findOne({ title }).select("-__v");
    },
    //     allJobs: async() =>{
    // return 
    //     },
    // job: async (parent) => {
    //   return Job.find({ title :{$regex:/developer/, $options:"i"} }).select("-__v");
    // },
    jobs: async () => {
      return Job.find().select("-__v");
    },
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    addToSavedJobs: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedJobs: args.bookData } },
          { new: true }
        )
        return updatedUser;
      }
      throw new AuthenticationError("Not logged in");
    },

    addToAppliedJobs: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { appliedJobs: args.bookData } },
          { new: true }
        )
        return updatedUser;

      }
      throw new AuthenticationError("Not logged in");
    },

    register: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
  },
};

module.exports = resolvers;
