import type { Input } from "./Input.model";
import type { Output } from "./output.model";

export interface Transaction {
    id: string;
    inputs: Array<Input>;
    outputs: Array<Output>;
}
