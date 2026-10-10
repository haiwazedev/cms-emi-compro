# Rules

- Keep code clean, simple, minimal, readable, maintainable, and human-friendly
- Prioritize clean code and refactor if possible
- Prioritize using shadcn components if possible
- Prioritize create or using existing tailwind variables instead of custom string value if possible
- Prioritize using `flex` layout rather than `grid` layout if possible
- Only run `pnpm lint` and `pnpm build` for verification
- Run prettier on all new or modified files
- No need to run visual checks for verification
- Use general and well-known tailwind classes if possible
- Use `lg` as mobile view breakpoint
- Use only `lg` breakpoint
- Avoid using custom value for tailwind like `property-[<value>]` if possible
- Prioritize refactor child item / multiple occurences UI to own component if possible
- Prioritize using existing tailwind color variables instead of creating a new one, notify user if new one is needed
- Do not modify global index.css unless told so, use available colors provided.
