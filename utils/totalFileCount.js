const totalFileCount = (data) => data.filter((entry) => entry.isFile()).length;

export default totalFileCount;
