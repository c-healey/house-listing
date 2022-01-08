import {
  useEffect,
  useState,
  useContext,
  createContext,
  FunctionComponent,
} from "react";
import router, { useRouter } from "next/router";
import firebase from "firebase/app";
import "firebase/auth";
import initFirebase from "./initFirebase";
import { removeTokenCookie, setTokenCookie } from "./tokenCookies";
import { NoSchemaIntrospectionCustomRule } from "graphql";

initFirebase();
interface IAuthContext {
  user: firebase.User | null;
  logout: () => void;
  authenticated: boolean;
}
const AuthContext = createContext<IAuthContext>({
  user: null,
  logout: () => null,
  authenticated: false,
});

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const router = useRouter();

  const logout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        router.push("/");
      })
      .catch((e) => console.log(e));
  };
  useEffect(() => {
    const cancelAuthListener = firebase
      .auth()
      .onIdTokenChanged(async (user) => {
        if (user) {
          const token = await user.getIdToken();
          setTokenCookie(token);
          setUser(user);
        } else {
          removeTokenCookie();
          setUser(null);
        }
      });
      return ()=>{
          cancelAuthListener()
      }
  }, []);
  return (
    <AuthContext.Provider value={{ user, authenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = ()=>{
    return useContext(AuthContext)
}