
interface anyObject<T = any> {
  [prop:string]: T
}
interface map {
  tags?: anyObject;
  categories?: anyObject;
}