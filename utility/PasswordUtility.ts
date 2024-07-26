import bcrypt from "bcryptjs";

export const GenerateSalt = async (): Promise<string> => {
  try {
    return await bcrypt.genSalt();
  } catch (err: any) {
    console.log("====================error in geneSalt==============", err);
    return err;
  }
};

export const GeneratePassword = async (
  password: string,
  salt: string
): Promise<string> => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (err: any) {
    console.log("====================error in geneSalt==============", err);
    return err;
  }
};
