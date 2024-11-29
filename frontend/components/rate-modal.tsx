import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Slider,
} from "@nextui-org/react";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
}

export const RateModal = ({ isOpen, onOpenChange }: Props) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <p className="text-lg">Rate this loop</p>
        </ModalHeader>
        <ModalBody className="gap-4 mb-2">
          <Slider
            showSteps
            label="Rating"
            maxValue={10}
            minValue={1}
            size="lg"
            step={1}
          />
          <Button type="submit">Submit</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
