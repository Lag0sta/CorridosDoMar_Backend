import mongoose from "mongoose";

const connectionString : string = process.env.CONNECTION_STRING as string;

export async function connectToDatabase(): Promise<typeof mongoose | Error> {
	try {
		await mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
	          console.log('Data Connected');
			  return mongoose;
	    }catch(error) {
			console.error('Error', error);
			return error as Error;
		}
}
