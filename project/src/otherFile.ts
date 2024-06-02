import { testing } from "./another";
import { MyClass } from "./class";
import { myObj } from "./object";

const test = () => {
  const a = new MyClass();
  testing(a.myMethod());
};
