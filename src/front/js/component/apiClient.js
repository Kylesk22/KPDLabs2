export async function apiClient(url, options = {}, logout) {
    try {
      const res = await fetch(url, {
        ...options,
        credentials: "include",
      });
      console.log(res.status, 'apiClient logout')
      if (res.status === 401) {
        logout("expired");
        throw new Error("Session expired");
      }
  
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }