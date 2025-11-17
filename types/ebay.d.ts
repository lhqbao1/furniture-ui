interface EbaySyncErrorResponse {
  detail: {
    errors: { message: string }[];
  };
}

type KauflandError = {
  detail: {
    errors: { message: string }[];
  };
};

type AmazonError = {
  detail: {
    errors: { message: string }[];
  };
};

type AuthError = {
  detail: {
    error: string;
    error_description: string;
  };
};

type GenericError = { message: string };
