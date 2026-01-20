export const AuthTab = {
    getId(): string {
      if (typeof window === "undefined") return "server";
  
      let id = sessionStorage.getItem("__tab_id__");
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("__tab_id__", id);
      }
      return id;
    },
  };