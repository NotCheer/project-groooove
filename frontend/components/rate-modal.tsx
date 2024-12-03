import {
  Button,
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Slider,
} from "@nextui-org/react";
import useSWR from "swr";
import { useEffect, useState } from "react";

import { LoopInfoJson } from "@/types";
import { useUserId } from "@/hooks/useUserId";
import { createRating, getRating, updateRating } from "@/util/api";

interface Props {
  isOpen: boolean;
  onOpenChange: () => void;
  loopInfo: LoopInfoJson;
}

export const RateModal = ({ isOpen, onOpenChange, loopInfo }: Props) => {
  const [submitted, setSubmitted] = useState(false);
  const userId = useUserId();

  const { data, isLoading, error } = useSWR(
    [loopInfo.id, userId, "getRating"],
    ([id]) => getRating(id),
  );

  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (data != null) {
      setRating(data.rating ?? rating);
    }
  }, [data]);

  const submitRating = async () => {
    try {
      if (typeof data?.rating !== "number") {
        await createRating(loopInfo.id, rating);
      } else {
        await updateRating(loopInfo.id, rating);
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalBody className="gap-4 mb-2">{error as string}</ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setSubmitted(false)}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader>
          <p className="text-lg">Rate &quot;{loopInfo.title}&quot;</p>
        </ModalHeader>
        <ModalBody className="gap-4 mb-2">
          {!data || isLoading ? (
            <CircularProgress className="mx-auto" size="lg" />
          ) : (
            <>
              <Slider
                showSteps
                defaultValue={data?.rating ?? undefined}
                label="Rating"
                maxValue={10}
                minValue={1}
                size="lg"
                step={1}
                value={rating}
                onChange={(value) => {
                  if (typeof value === "number") {
                    setRating(value);
                  }
                }}
              />
              <Button type="submit" onPress={submitRating}>
                Submit
              </Button>
              {submitted && <p className="text-success">Rating submitted!</p>}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
