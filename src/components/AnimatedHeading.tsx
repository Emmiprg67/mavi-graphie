type AnimatedHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  className?: string;
  eyebrowClassName?: string;
  level?: 1 | 2;
};

export function AnimatedHeading({
  id,
  eyebrow,
  title,
  className = "",
  eyebrowClassName = "eyebrow mb-4",
  level = 2,
}: AnimatedHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <>
      {eyebrow ? (
        <p className={eyebrowClassName}>{eyebrow}</p>
      ) : null}
      <Heading id={id} className={className}>
        {title}
      </Heading>
    </>
  );
}
