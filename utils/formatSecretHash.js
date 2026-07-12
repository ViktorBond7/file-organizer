const formatSecretHash = (secret) =>
  secret.toUpperCase().slice(0, 3) + "-" + secret.slice(3);

export default formatSecretHash;
