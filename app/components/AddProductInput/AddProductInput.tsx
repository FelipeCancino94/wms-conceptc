import { ScanBarcode } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function AddProductInput() {
  return(
    <InputGroup className="max-w-xs">
      <InputGroupInput className="text-xl!" placeholder="Search..." />
      <InputGroupAddon>
        <ScanBarcode className="size-6!" />
      </InputGroupAddon>
    </InputGroup>
  )
}