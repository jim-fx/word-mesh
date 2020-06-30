import "../@types";
import { crawl } from "../crawl";
import "./toggle";
export default function (state: State<Await<ReturnType<typeof crawl>>>): void;
