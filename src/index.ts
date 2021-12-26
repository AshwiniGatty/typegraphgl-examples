import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { buildSchema } from "type-graphql";
import { EmployeeResolver } from "./graphql/resolvers/employeeResolver";
import { DepartmentResolver } from "./graphql/resolvers/departmentResolver";
import { ProjectResolver } from "./graphql/resolvers/projectResolver";
import { ProjectAssignmentResolver } from "./graphql/resolvers/projectAssignmentResolver";
import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { AuthResolver } from "./graphql/resolvers/authResolver";
import { ProfilePictureResolver } from "./graphql/resolvers/profilePictureResolver";
import { graphqlUploadExpress } from "graphql-upload";

const main = async () => {
	const schema = await buildSchema({
		resolvers: [
			AuthResolver,
			EmployeeResolver,
			DepartmentResolver,
			ProjectResolver,
			ProjectAssignmentResolver,
			ProfilePictureResolver,
		],
	});

	const apolloServer = new ApolloServer({
		schema,
		context: ({ req }) => {
			const context = {
				req,
			};
			return context;
		},
	});

	const app = Express();

	await apolloServer.start();
	app.use(graphqlUploadExpress());
	apolloServer.applyMiddleware({ app });

	// Initialize using firebase adin SDK
	// This is used to generate customized token.

	const serviceAccount = require("../serviceAccountKey.json");
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});

	// Initialize using firebase config
	// Used to verify the customized token.
	const firebaseConfig = require("../firebaseConfig.json");
	initializeApp(firebaseConfig);

	app.listen(4000, () => {
		console.log("server started on http://localhost:4000/graphql");
	});
};

main().catch((err) => console.error(err));
